package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2988540424")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "@request.auth.role = 'admin' && status = 'created'",
			"listRule": "(@request.auth.role = 'admin' && status != 'deleted') || status = 'complete'",
			"updateRule": "@request.auth.role = 'admin' && status != 'deleted'",
			"viewRule": "(@request.auth.role = 'admin' && status != 'deleted') || status = 'complete'"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2988540424")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "@request.auth.role = 'admin'",
			"listRule": "@request.auth.role = 'admin' || status = 'complete'",
			"updateRule": "@request.auth.role = 'admin'",
			"viewRule": "@request.auth.role = 'admin' || status = 'complete'"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
