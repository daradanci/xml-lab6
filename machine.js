class StateMachine {
    constructor({ initial, states, transitions, data = null }) {
        this.transitions = transitions
        this.states = states
        this.state = initial
        this.data = data
    }

    stateOf() {
        return this.state
    }

    _updateState(newState, data = null) {
        this.state = newState
        this.data = data
    }
    performTransition(transitionName) {
        const possibleTransitions = this.transitions[this.state]
        const transition = possibleTransitions[transitionName]
        if (!transition) return

        // переход возвращает новое состояние для автомата
        const newState = transition()
        this._updateState(newState)
    }
}