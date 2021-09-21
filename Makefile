.PHONY: dev
dev: api/dist
	docker-compose up --build --remove-orphans

%/dist: %/node_modules
	bash -c "cd $$(dirname $@) ; npm run build"

%/node_modules:
	bash -c "cd $$(dirname $@) ; npm install"

.PHONY: clean
clean:
	rm -rf api/dist
	rm -rf api/node_modules
	docker-compose rm
