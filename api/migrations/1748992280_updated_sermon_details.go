package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_4155639682")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"deleteRule": "@request.auth.role = 'admin'",
			"listRule": "@request.auth.role = 'admin' || sermon_id.status = 'complete'",
			"viewRule": "@request.auth.role = 'admin' || sermon_id.status = 'complete'"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_4155639682")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"deleteRule": null,
			"listRule": "@request.auth.role = 'admin' || sermon_id.status = 'created'",
			"viewRule": "@request.auth.role = 'admin' || sermon_id.status = 'created'"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
