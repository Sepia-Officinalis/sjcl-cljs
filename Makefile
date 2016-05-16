CLOSURE_VERSION=20160315

all: src/sjcl/sjcl.js src/sjcl/sjcl.min.js

src/sjcl/%.js: build/%.js
	cp $< $@

# TODO: Make sure tests pass, fail o/w
build/sjcl.js: build/sjcl/core.js build/closure.jar
	java -jar build/closure.jar \
             --compilation_level=SIMPLE_OPTIMIZATIONS \
	     --formatting=pretty_print \
	     --externs src/sjcl/externs/sjcl.js \
	     --js $< \
	     --js_output_file $@
	cp $@ build/sjcl/sjcl.js
	make -C build/sjcl test

# TODO: Make sure tests pass, fail o/w
build/sjcl.min.js: build/sjcl.js build/closure.jar
	java -jar build/closure.jar \
             --compilation_level=ADVANCED_OPTIMIZATIONS \
	     --externs src/sjcl/externs/sjcl.js \
	     --js $< \
	     --js_output_file $@
	cp $@ build/sjcl/sjcl.js
	make -C build/sjcl test

build/sjcl:
	mkdir -p build
	[ -d $@ ] || git clone https://github.com/bitwiseshiftleft/sjcl.git $@
	touch $@

build/sjcl/core.js: build/sjcl
	(cd $< ; ./configure --with-all)
	make -C $< $(notdir $@) core_closure.js
	touch $@

build/closure-compiler-$(CLOSURE_VERSION):
	mkdir -p build
	[ -d $@ ] || (cd $(dir $@) ; curl https://codeload.github.com/google/closure-compiler/tar.gz/v$(CLOSURE_VERSION) | tar zxv)
	touch $@

build/closure: build/closure-compiler-$(CLOSURE_VERSION)
	rm -f $@
	(cd $(dir $<) ; ln -s $(notdir $<) $(notdir $@))

build/closure/target/closure-compiler-1.0-SNAPSHOT.jar: build/closure
	[ -f $@ ] || (cd $< ; mvn -DskipTests package)
	touch $@

build/closure.jar: build/closure/target/closure-compiler-1.0-SNAPSHOT.jar
	rm -f $@
	(cd $(dir $@) ; ln -s closure/target/$(notdir $<) $(notdir $@))

clean:
	rm -rf build/
