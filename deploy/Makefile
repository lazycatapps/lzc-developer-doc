.PHONY: all clean push-image image

UI_DIR = ..
DIST_DIR = $(UI_DIR)/docs/.vitepress/dist
UI_INDEX = $(UI_DIR)/docs/.vitepress/dist/index.html

DEPLOY_SOURCE = \
	Dockerfile \
	nginx.conf \
	docker-entrypoint.sh \
	$(NULL)

GO_SOURCE = \
	$(GO_DIR)/go.mod $(GO_DIR)/go.sum \
	$(shell find $(GO_DIR) -type f -name '*.go') \
	$(NULL)

UI_SOURCE = \
	$(shell find $(UI_DIR)/docs -not -path '../docs/.vitepress/dist/*' -and -not -path '../docs/.vitepress/cache/*' -and -type f) \
	$(NULL)

IMAGE_TAG = registry.corp.lazycat.cloud/homecloud/lzc-developer-community:latest

K8S_NAMESPACE ?= lazycat-service
K8S_DEPLOYMENT ?= lzc-developer-community

# all
all: image



ifndef SSH_KEY
ifneq ($(wildcard $(HOME)/.ssh/jenkins.key),)
SSH_KEY = $(HOME)/.ssh/jenkins.key
else ifneq ($(wildcard $(HOME)/.ssh/id_rsa),)
SSH_KEY = $(HOME)/.ssh/id_rsa
else ifneq ($(wildcard $(HOME)/.ssh/id_ed25519),)
SSH_KEY = $(HOME)/.ssh/id_ed25519
else
$(error no valid SSH_KEY)
endif
endif

export GIT_SSH_COMMAND := ssh -i $(SSH_KEY)



# push image
DOCKER_BUILD_CONTEXT = ..
push-image: $(DOCKER_BUILD_CONTEXT)/.pushed.timestamp
$(DOCKER_BUILD_CONTEXT)/.pushed.timestamp: $(DOCKER_BUILD_CONTEXT)/.image.timestamp
	docker push $(IMAGE_TAG)
	touch "$@"

# image
image: $(DOCKER_BUILD_CONTEXT)/.image.timestamp
$(DOCKER_BUILD_CONTEXT)/.image.timestamp: $(BINARY) $(UI_INDEX) $(DEPLOY_SOURCE)
	docker build -f Dockerfile -t "$(IMAGE_TAG)" "$(DOCKER_BUILD_CONTEXT)"
	touch "$@"

# npm install
$(UI_DIR)/node_modules/.package-lock.json: $(UI_DIR)/package-lock.json
	cd $(UI_DIR); npm clean-install --registry https://registry.npmmirror.com

# ui
$(UI_INDEX): $(UI_SOURCE) $(UI_DIR)/node_modules/.package-lock.json
	cd $(UI_DIR); npm run docs:build

clean:
	rm -rf $(BINARY) $(BINARY_DEBUG) $(UI_DIR)/docs/.vitepress/dist

dist:
	cd $(UI_DIR); npm clean-install --registry https://registry.npmmirror.com; npm run docs:build

deploy:
	coscli sync --exclude ".*index\.html$" --recursive $(DIST_DIR) cos://www-dev-lazycat-1301583638
	coscli sync --recursive $(DIST_DIR) cos://www-dev-lazycat-1301583638
