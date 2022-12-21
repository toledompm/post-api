IMG_NAME=post-api
IMG_TAG=latest
DEV_IMG_NAME=$(IMG_NAME)-dev
DEV_IMG_TAG=latest

.PHONY: docker-dev-build
docker-dev-build:
	DOCKER_BUILDKIT=1 docker build --target build -t "$(IMG_NAME):$(IMG_TAG)" .

.PHONY: docker-dev
docker-dev: docker-dev-build
	docker run --rm -it -p 3000:3000 -v "$(PWD):/app" "$(IMG_NAME):$(IMG_TAG)" npm run dev

.PHONY: docker-test
docker-test: docker-dev-build
	docker run --rm -v "$(PWD):/app" "$(IMG_NAME):$(IMG_TAG)" npm run test
