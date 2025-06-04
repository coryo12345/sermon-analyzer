package ai

import (
	"api/internal/models"
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strings"

	"google.golang.org/genai"
)

//go:embed prompt.txt
var prompt string

type Analyzer interface {
	AnalyzeSermon(job models.SermonAnalysisJob) (AnalysisResult, error)
}

type AnalysisResult struct {
	Summary   string                  `json:"summary"`
	Questions []models.SermonQuestion `json:"questions"`
	Details   []models.SermonDetail   `json:"notes"`
}

func NewAnalyzer(job models.SermonAnalysisJob, logger *slog.Logger) (Analyzer, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("GEMINI_API_KEY"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}

	return &sermonAnalyzer{
		ctx:    ctx,
		job:    job,
		client: client,
		logger: logger,
	}, nil
}

type sermonAnalyzer struct {
	ctx    context.Context
	job    models.SermonAnalysisJob
	client *genai.Client
	logger *slog.Logger
}

func (a *sermonAnalyzer) AnalyzeSermon(job models.SermonAnalysisJob) (AnalysisResult, error) {
	if job.AudioURL == "" {
		return AnalysisResult{}, errors.New("audio url is required")
	}

	a.logger.Info("Downloading sermon audio", "url", job.AudioURL, "job_id", job.Id)
	tmpFile, err := downloadFile(job.AudioURL, job.Id)
	if err != nil {
		return AnalysisResult{}, err
	}
	defer tmpFile.Close()
	a.logger.Info("Audio downloaded", "job_id", job.Id, "file", tmpFile.Name())

	file, err := a.client.Files.UploadFromPath(a.ctx, tmpFile.Name(), nil)
	if err != nil {
		return AnalysisResult{}, err
	}
	defer a.client.Files.Delete(a.ctx, file.Name, nil)

	parts := []*genai.Part{
		genai.NewPartFromText(prompt),
		genai.NewPartFromURI(file.URI, file.MIMEType),
	}
	contents := []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}

	a.logger.Info("Uploading audio to Gemini", "job_id", job.Id)
	resp, err := a.client.Models.GenerateContent(a.ctx, "gemini-2.5-flash-preview-05-20", contents, &genai.GenerateContentConfig{
		MaxOutputTokens: 65536,
	})
	if err != nil {
		return AnalysisResult{}, err
	}

	a.logger.Info("Gemini response", "job_id", job.Id, "response", resp.Text())
	text := strings.ReplaceAll(resp.Text(), "```json", "")
	text = strings.ReplaceAll(text, "```", "")

	var result AnalysisResult
	err = json.Unmarshal([]byte(text), &result)
	if err != nil {
		return AnalysisResult{}, errors.Join(err, errors.New("failed to unmarshal response: "+resp.Text()))
	}

	return result, nil
}

// downloadFile downloads a file from a url to a temp file
// NOTE: returned file must be closed by the caller!
func downloadFile(url string, jobId string) (*os.File, error) {
	tmpDir := os.TempDir()

	ext := path.Ext(strings.Split(url, "?")[0])
	tempFile := path.Join(tmpDir, fmt.Sprintf("sermon-%s.%s", jobId, ext))

	out, err := os.Create(tempFile)
	if err != nil {
		return nil, err
	}
	defer out.Close()

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bad status: %s", resp.Status)
	}

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return nil, err
	}

	return out, nil
}
