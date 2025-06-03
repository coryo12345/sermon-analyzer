package jobs

import (
	"api/internal/ai"
	"api/internal/models"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func SermonAnalysisJob(app *pocketbase.PocketBase) {
	sermonJobs := []models.SermonAnalysisJob{}
	err := app.DB().NewQuery("SELECT * FROM analysis_jobs WHERE sermon_id IN (SELECT id FROM sermons WHERE status = 'created')").All(&sermonJobs)
	if err != nil {
		app.Logger().Error("SermonAnalysisJob: Error getting sermon jobs", "error", err.Error())
		return
	}

	if len(sermonJobs) == 0 {
		return
	}

	app.Logger().Info("SermonAnalysisJob: Found sermon jobs", "count", len(sermonJobs))
	for _, job := range sermonJobs {
		analyzer, err := ai.NewAnalyzer(job, app.Logger())
		if err != nil {
			app.Logger().Error("SermonAnalysisJob: Error creating analyzer", "error", err.Error())
			setStatus(app, job, models.SermonStatusError)
			continue
		}

		setStatus(app, job, models.SermonStatusPending)
		result, err := analyzer.AnalyzeSermon(job)
		if err != nil {
			app.Logger().Error("SermonAnalysisJob: Error analyzing sermon", "error", err.Error())
			setStatus(app, job, models.SermonStatusError)
			continue
		}

		err = upsertRecords(app, job, result)
		if err != nil {
			app.Logger().Error("SermonAnalysisJob: Error storing result into DB", "error", err.Error())
			setStatus(app, job, models.SermonStatusError)
			continue
		}

		app.Logger().Info("SermonAnalysisJob: Analysis complete", "job", job.Id)
		setStatus(app, job, models.SermonStatusComplete)
	}
}

func setStatus(app *pocketbase.PocketBase, job models.SermonAnalysisJob, status string) error {
	record, err := app.FindRecordById("sermons", job.SermonId)
	if err != nil {
		app.Logger().Error("SermonAnalysisJob: ERROR: Unable to set status of sermon job", "job", job.Id, "error", err.Error())
		return err
	}

	record.Set("status", status)

	err = app.Save(record)
	if err != nil {
		app.Logger().Error("SermonAnalysisJob: ERROR: Unable to set status of sermon job", "job", job.Id, "error", err.Error())
		return err
	}

	return nil
}

func upsertRecords(app *pocketbase.PocketBase, job models.SermonAnalysisJob, result ai.AnalysisResult) error {
	sermon, err := app.FindRecordById("sermons", job.SermonId)
	if err != nil {
		return err
	}

	sermon.Set("summary", result.Summary)
	err = app.Save(sermon)
	if err != nil {
		return err
	}

	detailsCollection, err := app.FindCollectionByNameOrId("sermon_details")
	if err != nil {
		return err
	}

	for i, detail := range result.Details {
		detailRecord := core.NewRecord(detailsCollection)
		detailRecord.Set("sermon_id", job.SermonId)
		detailRecord.Set("title", detail.Title)
		detailRecord.Set("description", detail.Description)
		detailRecord.Set("key_verse", detail.KeyVerse)
		detailRecord.Set("relevant_verses", detail.RelevantVerses)
		detailRecord.Set("order", i)
		err = app.Save(detailRecord)
		if err != nil {
			return err
		}
	}

	questionsCollection, err := app.FindCollectionByNameOrId("sermon_questions")
	if err != nil {
		return err
	}

	for i, question := range result.Questions {
		questionRecord := core.NewRecord(questionsCollection)
		questionRecord.Set("sermon_id", job.SermonId)
		questionRecord.Set("title", question.Title)
		questionRecord.Set("description", question.Description)
		questionRecord.Set("order", i)
		err = app.Save(questionRecord)
		if err != nil {
			return err
		}
	}

	return nil
}
