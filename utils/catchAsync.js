module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
    // above catch is shothand for catch(e => next(e)). Both are same.
}