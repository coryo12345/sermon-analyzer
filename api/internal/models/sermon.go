package models

import "time"

const (
	SermonStatusCreated  = "created"
	SermonStatusPending  = "pending"
	SermonStatusComplete = "complete"
	SermonStatusError    = "error"
)

type Sermon struct {
	Id        string    `json:"id" db:"id"`
	Title     string    `json:"title" db:"title"`
	Status    string    `json:"status" db:"status"`
	Date      time.Time `json:"date_given" db:"date_given"`
	Summary   string    `json:"summary" db:"summary"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type SermonAnalysisJob struct {
	Id        string    `json:"id" db:"id"`
	SermonId  string    `json:"sermon_id" db:"sermon_id"`
	AudioURL  string    `json:"audio_url" db:"audio_url"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type SermonDetail struct {
	Id             string    `json:"id" db:"id"`
	SermonId       string    `json:"sermon_id" db:"sermon_id"`
	Title          string    `json:"title" db:"title"`
	Description    string    `json:"description" db:"description"`
	KeyVerse       string    `json:"key_verse" db:"key_verse"`
	RelevantVerses string    `json:"relevant_verses" db:"relevant_verses"` // Pipe separated list of verses
	Order          int       `json:"order" db:"order"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

type SermonQuestion struct {
	Id          string    `json:"id" db:"id"`
	SermonId    string    `json:"sermon_id" db:"sermon_id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	Order       int       `json:"order" db:"order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
