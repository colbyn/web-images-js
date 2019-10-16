set -e;

_subroutine_a () {
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "--app=http://localhost:2000/" "--auto-open-devtools-for-tabs" &> "/dev/null"
}

run-chrome () {
    _subroutine_a
}


case $1 in
    ("run-chrome") run-chrome ;;
esac
