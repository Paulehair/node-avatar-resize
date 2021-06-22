init:
# Create git hooks 
	git config core.hooksPath .githooks
# Start db container
	docker-compose up -d db
# SQL dump 
	docker exec -it avatar-resizer_db sh -c "psql db < /tmp/database.sql"

dev:
	docker-compose up -d

stop:
	docker-compose stop

logs:
	docker-compose logs --follow
	