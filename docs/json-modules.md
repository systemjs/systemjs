# JSON Modules

[JSON modules](https://github.com/whatwg/html/pull/4407) are supported in both s.js and system.js.

## Example

**file.json**
```json
{
  "some": "json value"
}
```

```js
System.import('file.json').then(function (module) {
  console.log(module.default); // The json as a js object.
});
```