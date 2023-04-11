IMG_NAME=node
IMG_TAG=18.12-slim

.PHONY: docker-dev
docker-dev:
	docker run \
		--rm \
		-it \
		-v "$(PWD):/app" \
		-w /app \
		-p 3000:3000 \
		--env-file .env \
		"$(IMG_NAME):$(IMG_TAG)" \
		npm run dev

.PHONY: docker-test
docker-test:
	docker run \
		--rm \
		-it \
		-v "$(PWD):/app" \
		-w /app \
		--env-file .env \
		"$(IMG_NAME):$(IMG_TAG)" \
		npm run test

.PHONY: docker-test
docker-shell:
	docker run \
		--rm \
		-it \
		-v "$(PWD):/app" \
		-w /app \
		--env-file .env \
		"$(IMG_NAME):$(IMG_TAG)" \
		sh
