## FAQ's

Some answers to common questions, common issues and errors.

* Architecture Questions
* Common Workflow Problems
* SystemJS Error Messages

### Architecture Questions

_TODO_

### Common Workflow Problems

_TODO_

### SystemJS Error Messages

_TODO_

#### baseURL should only be configured once and must be configured first

SystemJS stores all modules in a registry that is keyed by URL.

In order to ensure this registry uses unique names, we normalize all modules using this baseURL and other configurations.

Changing the baseURL after loading modules is not permitted because it would stop any existing modules in the registry from being reusable anymore.

Rather [create a new SystemJS loader instance](system-api.md#systemconstructor) if you're looking to start a new registry with different configuration rules.