# bitauth-cljs

A ClojureScript wrapper around the [Stanford Javascript Crypto Library](https://github.com/bitwiseshiftleft/sjcl)

## Installation

To use this in your git project, first set up [jitpack.io](https://jitpack.io/) as a repository.  You can do this by adding to your `project.clj`:

```
:repositories [["jitpack" "https://jitpack.io"]]
```

Then add to your dependencies:

```
:dependencies [[com.github.xcthulhu/sjcl-cljs "0.1.0"]]
```

## Usage

To use this in your project, add to your ClojureScript namespace:

```
(ns my-cool-namespace 
  (:require [sjcl]))
```

You can then access the object via an object `js/sjcl`.  The API for `js/sjcl` is described in the [official documentation](https://bitwiseshiftleft.github.io/sjcl/doc/).

## Notes

The JavaScript included in this project comes from a snapshot build of SJCL (commit [ade8ea3344](https://github.com/bitwiseshiftleft/sjcl/tree/ade8ea33449a91406a9af3e133c9374e0133b891)).

Note that SJCL uses Closure along with some pre and post-processing scripts to make releases.  The code that is neither pre nor post-processed does not work in headless environments without `js/window`.  The file `sjcl.min.js` is the result of their ordinary release, which uses `ADVANCED_OPTIMIZATIONS`, while `sjcl.js` is the result of using `SIMPLE_OPTIMIZATIONS`.

The externs file has been written to pass the official SJCL unit tests with either the minified or "unminified" code with just simple optimizations. Both `sjcl.js` and `sjcl.min.js` should work in headless environments.

## License

Distributed under the GPL v2.0 license.
