### Circuit Breaker

I implemented Circuit Breaker in order to avoid the creation of new Escrow Payments if a bug comes up, if the contract is stopped you will not be able to generate a new Escrow, but if you want to pay an Escrow you will be able to do it.

### Fail early and fail loud

I implemented several Modifier for the functions, all those modifiers will be checked at very early stages of the method execution.

### Restricting Access

I implemented a private access for escrow mapping, anyone outside this contract should interact with that mapping.