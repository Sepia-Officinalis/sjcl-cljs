(require '[clojure.java.shell :refer [sh]])

(def +version+
  "Get the version number from git"
  (-> (sh "git" "describe" "--tags" "--always") :out clojure.string/trim))

(defproject sjcl-cljs +version+
  :description "ClojureScript wrapper around the Stanford Javascript Crypto Library"
  :url "https://github.com/xcthulhu/sjcl-cljs"
  :license {:name "GPL2"
            :url "https://opensource.org/licenses/GPL-2.0"})
