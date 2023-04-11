# drep

drep is a basic clone of `grep` (or more accurately, `rgrep`) written in Deno with no third-party dependencies. It uses workers to search files in separate threads, making it faster than standard `grep` (but not faster than other modern versions like `ripgrep`).

## Use it

To use drep, you can run the following commands:

`drep "some string" file_or_folder`: Search for a string in a file or folder.

`cat some_file.txt | drep "some string"`: Search for a string in stdin.

`drep "some string" .`: Search for a string in the current directory.

You can also pass a valid JavaScript RegExp instead of a search string.

### Flags

`-n`: Include line numbers in the search results.

`-i`: Perform a case-insensitive search.

## Building and Testing

To build drep, run `bash build.sh` to create a binary at `./drep`.

To run the tests, use the following command: `deno test -A`.

## Contributing

If you'd like to contribute to drep, please follow these guidelines:

- Before submitting a pull request, please create an issue describing the change you'd like to make.
- Make sure your code follows the existing style and conventions.
- Write tests for your changes.
- Run the tests and make sure they pass.
- Submit a pull request and await feedback from me!
