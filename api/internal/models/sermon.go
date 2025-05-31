package models

import "time"

type Sermon struct {
	Id        string    `json:"id" db:"id"`
	Title     string    `json:"title" db:"title"`
	AudioURL  string    `json:"audio_file_path" db:"audio_file_path"`
	Date      time.Time `json:"date_given" db:"date_given"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
