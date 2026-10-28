.PHONY: setup install start dev build preview test lint typecheck format

setup: install

install:
	npm ci

start:
	npm start

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

test:
	npm test

lint: typecheck
	npm run lint

typecheck:
	npm run typecheck

format:
	npm run format
