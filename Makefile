dev:
	docker compose -f docker-compose.dev.yaml -f docker-compose.dev.kratos.yaml up -d
	docker compose -f docker-compose.dev.yaml up -d

prod:
	docker compose -f docker-compose.prod.yaml -f docker-compose.prod.kratos.yaml up -d
	docker compose -f docker-compose.prod.yaml up -d

build-dev:
	docker compose -f docker-compose.dev.yaml -f docker-compose.dev.kratos.yaml build
	docker compose -f docker-compose.dev.yaml build

build-prod:
	docker compose -f docker-compose.prod.yaml -f docker-compose.prod.kratos.yaml build
	docker compose -f docker-compose.prod.yaml build

down:
	docker compose -f docker-compose.dev.yaml -f docker-compose.dev.kratos.yaml down -v
	docker compose -f docker-compose.prod.yaml -f docker-compose.prod.kratos.yaml down -v
