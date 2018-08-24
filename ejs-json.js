'use strict'

var through = require('through2')
var PluginError = require('plugin-error')
var replaceExtension = require('replace-ext')
var ejs = require('ejs')
var Buffer = require('safe-buffer').Buffer
var fs = require("fs")
var path = require("path")

var ejsJson = function (data, options, settings) {
    data = data || {}
    options = options || {}
    settings = settings || {}
    let src = data || {}

    return through.obj(function (file, enc, cb) {
        let filename =  src.data +'/'+ RemoveChinese(file.relative)+'.json';
        var a = path.resolve(filename)
        if(fs.existsSync(a)){
            data = require(a)
        }else {
            data = {}
        }

        if (file.isNull()) {
            this.push(file)
            return cb()
        }

        if (file.isStream()) {
            this.emit(
                'error',
                new PluginError('trp-ejs', 'Streaming not supported')
            )
        }

        var fileData = Object.assign({}, data, file.data)
        options.filename = file.path

        try {
            file.contents = new Buffer.from(
                ejs.render(file.contents.toString(), fileData, options)
            )

            if (typeof settings.ext !== 'undefined') {
                file.path = replaceExtension(file.path, settings.ext)
            }
        } catch (err) {
            this.emit('error', new PluginError('trp-ejs', err.toString()))
        }

        this.push(file)
        cb()
    })
}

ejsJson.ejs = ejs

module.exports = ejsJson

function RemoveChinese(strValue) {
    if(strValue!= null && strValue != ""){
        var reg = /-[\u4e00-\u9fa5].*/g;
        return strValue.replace(reg, "");
    }
    else
        return "";
}
