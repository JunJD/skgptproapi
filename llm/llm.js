

const fetch = require('node-fetch')

class Llm {
    index = 0
    oldIndex = 0
    skeyList = []
    constructor(Skeys) {
        this.Skeys = Skeys
    }
    getSkeyList() {
        return new Promise((resolve, reject) => {
            this.Skeys.all((err, sKeys) => {
                if (err) {
                    resolve([])
                };
                resolve(sKeys)
            })
        })
    }
    nextIndex() {
        if (this.skeyList.length > this.index) {
            this.oldIndex = this.index
            return this.index++
        } else {
            this.oldIndex = this.skeyList.length - 1
            this.index = 0
            return this.index++
        }
    }
    async nextSKey(tick = 0) {
        if ((this.skeyList.length === 0) || (this.Skeys.fix !== this.Skeys.oldFix)) {
            this.skeyList = await this.getSkeyList()
        }

        if (this.skeyList.length > 0) {
            return this.skeyList[this.nextIndex()]
        }

        if (tick < 3) {
            return await (new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this.nextSKey(tick + 1))
                }, this.skeyList.length)
            }))

        }
        return { content: undefined }

    }
    async chat(body, tick = 0) {
        const { content } = await this.nextSKey()
        console.log(content)
        if (!content) {
            return {
                error: 'sk-没找到'
            }
        }
        const response = await fetch(
            "https://run.dingjunjie.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization:
                        "Bearer " + content,
                },
                body: JSON.stringify(body),
            }
        );
        // 对未成功返回的处理
        if (response !== 200) {
            switch (response.status) {
                case 429:
                    return await (new Promise((resolve) => {
                        setTimeout(async () => {
                            if (tick < this.skeyList.length) {
                                resolve(await this.chat(body, tick + 1))
                            } else {
                                resolve({
                                    error: '大量429!!'
                                })
                            }
                        }, tick * 300)
                    }))
                case 401:
                    if (!!this.skeyList.length) {
                        const { id, content } = this.skeyList[this.oldIndex]
                        console.warn(`!---${content}已失效---!`)
                        return await (new Promise((resolve) => {
                            this.Skeys.delete(id, async (err) => {
                                // this.nextIndex()
                                if (err) {
                                    console.log("err!?")
                                    if (!!this.skeyList.length - 1) {
                                        resolve(await this.chat(body, tick + 1))
                                    } else {
                                        resolve({
                                            error: '输的彻底!!!'
                                        })
                                    }
                                };
                                resolve(await this.chat(body, tick + 1))
                            })
                        }))
                    } else {
                        return {
                            error: '没货了!!!'
                        }
                    }
                case 500:
                    return {
                        error: '500'
                    }
            }
        }
        const data  = await response.json()
        console.log('data',JSON.stringify(data))
        return data
    }
}

module.exports.Llm = Llm;