IMG_NAME=node
IMG_TAG=18.12-slim

.PHONY: help
help: ## Show this help
	@cat $(MAKEFILE_LIST) | grep -E '^[a-zA-Z_-]+:.*?## .*$$' | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

.PHONY: docker-dev
docker-dev: ## Run the app in development mode
	@docker run \
		--rm \
		-it \
		-v "$(PWD):/app" \
		-v "./.oci:/root/.oci" \
		-w /app \
		-p 3030:3030 \
		--env-file .env \
		"$(IMG_NAME):$(IMG_TAG)" \
		npm run dev

.PHONY: docker-test
docker-test: ## Run app unit tests
	@docker run \
		--rm \
		-it \
		-v "$(PWD):/app" \
		-v "./.oci:/root/.oci" \
		-w /app \
		--env-file .env \
		"$(IMG_NAME):$(IMG_TAG)" \
		npm run test

.PHONY: docker-test
docker-shell: ## Run container shell
	@docker run \
		--rm \
		-it \
		-v "$(PWD):/app" \
		-v "./.oci/:/root/.oci/" \
		-w /app \
		--env-file .env \
		-p 3030:3000 \
		"$(IMG_NAME):$(IMG_TAG)" \
		sh
