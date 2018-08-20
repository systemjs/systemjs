(module
  (func $exampleImport (import "example" "exampleImport") (param i32) (result i32))
  (func $exampleExport (export "exampleExport") (param $value i32) (result i32)
    get_local $value
    call $exampleImport
  )
)
