# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := web_images_napi
### Rules for final target.
LDFLAGS_Debug := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first \
	-mmacosx-version-min=10.10 \
	-arch x86_64 \
	-L$(builddir) \
	-stdlib=libc++

LIBTOOLFLAGS_Debug := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first

LDFLAGS_Release := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first \
	-mmacosx-version-min=10.10 \
	-arch x86_64 \
	-L$(builddir) \
	-stdlib=libc++

LIBTOOLFLAGS_Release := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first

LIBS := \
	/Users/colbyn/Projects/web-images/node-api-ll/target/release/libweb_images_napi.dylib

$(builddir)/web_images_napi.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(builddir)/web_images_napi.node: LIBS := $(LIBS)
$(builddir)/web_images_napi.node: GYP_LIBTOOLFLAGS := $(LIBTOOLFLAGS_$(BUILDTYPE))
$(builddir)/web_images_napi.node: TOOLSET := $(TOOLSET)
$(builddir)/web_images_napi.node:  FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(builddir)/web_images_napi.node
# Add target alias
.PHONY: web_images_napi
web_images_napi: $(builddir)/web_images_napi.node

# Short alias for building this executable.
.PHONY: web_images_napi.node
web_images_napi.node: $(builddir)/web_images_napi.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/web_images_napi.node

