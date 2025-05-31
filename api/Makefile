BINARY_NAME=main.out
all: build test

build:
	go build -o ${BINARY_NAME} cmd/main.go

test:
	go test -v cmd/main.go

run:
	go run cmd/main.go

watch:
	if ! command -v air &> /dev/null; then \
		go install github.com/air-verse/air@latest; \
	fi; \
	air

clean:
	go clean
	rm -f ${BINARY_NAME}
