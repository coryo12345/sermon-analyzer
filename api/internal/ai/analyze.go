package ai

import "api/internal/models"

type Analyzer interface {
	AnalyzeSermon(sermon models.Sermon)
}

type AnalysisResult struct {
}
