# Functions and control flow

Wrap repeated logic in a function:

```r
greet <- function(name) {
  if (nchar(name) == 0) {
    "Hello, stranger!"
  } else {
    paste("Hello,", name)
  }
}
```

Functions plus if/else are the building blocks of every real R script.
