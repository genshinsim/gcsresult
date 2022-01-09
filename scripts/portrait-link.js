const genshindb = require("genshin-db");
const axios = require("axios")
const fs = require("fs")
const path = require("path")

let names = [
    "aether",
	"lumine",
	"albedo",
	"aloy",
	"amber",
	"barbara",
	"beidou",
	"bennett",
	"chongyun",
	"diluc",
	"diona",
	"eula",
	"fischl",
	"ganyu",
	"hutao",
	"jean",
	"kazuha",
	"kaeya",
	"ayaka",
	"keqing",
	"klee",
	"sara",
	"lisa",
	"mona",
	"ningguang",
	"noelle",
	"qiqi",
	"raiden",
	"razor",
	"rosaria",
	"kokomi",
	"sayu",
	"sucrose",
	"tartaglia",
	"thoma",
	"venti",
	"xiangling",
	"xiao",
	"xingqiu",
	"xinyan",
	"yanfei",
	"yoimiya",
	"zhongli",
	"gorou",
	"itto",
	"shenhe",
	"yunjin",
]

let image = {}

const download_image = (url, image_path) =>
    axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }),
    ).catch(e => console.log(e));

names.forEach(e => {
    const x = genshindb.characters(e)

    let filename = "./static/images/avatar/" + e + ".png"

    console.log(e + ": " + x.images.icon)

    download_image(x.images.icon, filename).then(msg => {
        console.log('done downloading to file: ', filename);
    }).catch(e => {
        console.log(e)
    })

})