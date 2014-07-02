/**
 * Created by stac on 02.07.2014.
 */

module.exports = {
    validateUser: function (obj)
    {
        var fieldname = null;

        function createError(error) {
            var out = {error: error, input: obj};
            if (fieldname) {
                out.field = fieldname;
            }
            return out;
        }

        fieldname = "name";
        if (!obj.name) {
            return createError("Bitte geben sie einen Namen ein");
        }
        if (obj.name.length < 6) {
            return createError("Name ist zu kurz");
        }
        return {input: obj};
    }
};
