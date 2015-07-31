var fs = require('fs');
var List = {
	dialog: {
		files: ["dialog.js", "dialog.css"]
	},
	"image-zooming": {
		files: ["image-zooming.js"]
	},
	"lazy-load": {
		files: ["lazy-load.js"]
	},
	"mobile-photo-preview": {
		"files": ["mobile-photo-preview.js", "mobile-photo-preview.css"],
		module: ["dialog"]
	},
	"mobile-select-area": {
		files: ["mobile-select-area.js", "mobile-select-area.css"],
		module: ["dialog"]
	},
	"mobile-select-date": {
		files: ["mobile-select-date.js"],
		module: ["mobile-select-area"]
	},
	"mobile-upload": {
		files: ["mobile-upload.js"]
	},
	"paging": {
		files: ["paging.js", "paging.css"]
	},
	"query": {
		files: ['query.js']
	},
	"scroll-load": {
		files: ['scroll-load']
	},
	table: {
		files: ["table.js"],
		module: ["dialog", "paging"]
	},
	upload: {
		files: ['upload.js']
	},
	"word-count": {
		files: ["word-count.js", "word-count.css"]
	}

};
var http = require('http');
/*
List.forEach(function(a,b) {


		for (var i in obj) {
			var dirname = i;
			var arr = obj[dirname];
			var dir = 'src/example/' + dirname;
			createDir(dir);
			arr.files.forEach(function(o) {
				var url = 'http://cdn.rawgit.com/tianxiangbing/' + dirname + '/master/src/' + o;
				var filename = o;
				if (o.indexOf('http') != -1) {
					url = o;
					filename = o.split('/').pop();
				}
				console.log('======dir========')
				console.log(dir)
				console.log('==============')
				getContent(dir + '/' + filename, url);
			});
			arr.module.forEach(function(m){

			})
		}
	})
 */

for (var module in List) {
	loadModule(module)
}

function loadModule(module, p) {
	var dirname = module;
	var arr = List[dirname];
	var dir = 'src/example/' + (p || dirname);
	createDir(dir);
	arr.files.forEach(function(o) {
		var url = 'http://rawgit.com/tianxiangbing/' + dirname + '/master/src/' + o;
		var filename = o;
		if (o.indexOf('http') != -1) {
			url = o;
			filename = o.split('/').pop();
		}
		console.log('======dir========')
		console.log(dir)
		console.log('==============')
		getContent(dir + '/' + filename, url);
	});
	if (arr.module) {
		arr.module.forEach(function(m) {
			loadModule(m, dirname)
		})
	}
}
//'http://cdn.rawgit.com/tianxiangbing/mobile-select-area/master/src/mobile-select-area.js'
function getContent(file, url) {
	console.log(url)
	http.get(url, function(res) {
		var str = '';
		res.on('data', function(d) {
			//process.stdout.write(d);
			str+=d;
		})
		res.on('end', function(d) {
			save(file, str);
		});
	});
};

function save(file, content) {
	fs.writeFile(file, content, function(err) {
		if (err) throw err;
	});
};
//创建目录
function createDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdir(dir);
	}
}