package ai

import (
	"api/internal/models"
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"os"
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

func NewAnalyzer(job models.SermonAnalysisJob) (Analyzer, error) {
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
	}, nil
}

type sermonAnalyzer struct {
	ctx    context.Context
	job    models.SermonAnalysisJob
	client *genai.Client
}

func (a *sermonAnalyzer) AnalyzeSermon(job models.SermonAnalysisJob) (AnalysisResult, error) {
	if job.AudioURL == "" {
		return AnalysisResult{}, errors.New("audio url is required")
	}

	// TODO - download the file from the audio url to a temp file
	// then use the temp file to upload to gemini
	// then delete the temp file

	file, err := a.client.Files.UploadFromPath(a.ctx, "/Users/cory/Downloads/test_sermon.m4a", nil)
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

	resp, err := a.client.Models.GenerateContent(a.ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		return AnalysisResult{}, err
	}

	text := strings.ReplaceAll(resp.Text(), "```json", "")
	text = strings.ReplaceAll(text, "```", "")

	var result AnalysisResult
	err = json.Unmarshal([]byte(text), &result)
	if err != nil {
		return AnalysisResult{}, errors.Join(err, errors.New("failed to unmarshal response: "+resp.Text()))
	}

	return result, nil
}
