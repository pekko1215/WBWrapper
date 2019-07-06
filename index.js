const Request = (() => {
    if (typeof window !== 'undefined') {

        return async(url, nocache) => {
            let cache = localStorage.getItem('dataCache') || '{}';
            cache = JSON.parse(cache);

            if (url in cache) {
                return cache[url];
            }
            let data = await fetch(url);
            data = await data.json();

            if (!nocache && data.result) {
                let cache = localStorage.getItem('dataCache') || '{}';
                cache = JSON.parse(cache);
                cache[url] = data;
                localStorage.setItem('dataCache', JSON.stringify(cache));
            };
            return data;
        };
    } else {
        return (url) => new Promise(r => {

            require('request')(url, (e, req, body) => {
                let data = JSON.parse(body);
                r(data);
            })
        })
    }
})()
const EndPoint = {
    Base: 'https://wb-api.glitch.me'
}

EndPoint.Cups = EndPoint.Base + '/api/bi/';
EndPoint.Board = EndPoint.Base + '/api/bd/';

class Rank {
    constructor(obj, team) {
        this.rankOrder = obj.rankOrder;
        this.userId = obj.userId;
        this.name = obj.name;
        this.pvnEventPoint = obj.pvnEventPoint;
        this.name = obj.name;
        this.leaderCardImg = obj.leaderCardImg;
        this.lv = obj.lv;
        this.team = team;
    }
}

class Team {
    constructor(obj, board) {
        this.id = obj.id;
        this.name = obj.name;
        this.is_all = obj.is_all;
        this.board = board;
    }
}

class Board {
    constructor(obj, cup) {
        this.date = new Date(obj.dateFormatted);
        this.url = obj.url;
        this.cup = cup;
        this.teams = obj.teams.map(obj => new Team(obj, this));
        this.ranks = obj.ranks.map((arr, i) => {
            return arr.map(d => {
                return new Rank(d, this.teams[i]);
            })
        });
        this.teams.forEach((team, i) => team.ranks = this.ranks[i]);
    }
}

class Cup {
    constructor(obj) {
        this.title = obj.title;
        this.first = obj.first;
        this.last = obj.last;
        this.id = obj.id;
    }
    async getBoardInfomation(query, nocache) {
            if (this.id == -1 || this.id === undefined) return null;
            let url = EndPoint.Board + `${this.id}/` + query;
            if (!this.nowPlaying) nocache = false;
            let data = await Request(url, nocache);
            if (!data.result) return null;
            data.url = url;
            data.data = data.data.map(d => {
                d.url = url;
                return new Board(d, this);
            });
            return data;
        }
        /**
         *全取得。非常に重いので非推奨
         */
    async getBoardInfomationAll() {
            return await this.getBoardInfomation('all', true);
        }
        /**
         * XX:55のみ(ex: 17:55など)を取得。よほどのことがない限りこちらを推奨
         */
    async getBoardInfomationHours(date) {
            return await this.getBoardInfomation('hours');
        }
        /**
         * 最終更新データを確認。
         */
    async getBoardInfomationLast() {
        return await this.getBoardInfomation('last', true);
    }

    /**
     * (day+1)日目最終更新を取得。daylast/0なら1日目。
     */
    async getBoardInfomationDaylast(day) {
        return await this.getBoardInfomation('daylast/' + day, true);
    }

    /**
     * ある時間におけるボードを取得。time/2019/02/28/15/50などと指定する。
     */
    async getBoardInfomationTime(year = 0, month = 0, day = 0, hour = 0, min = 0) {
        return await this.getBoardInfomation(`time/${year}/${month}/${day}/${hour}/${min}`)
    }

    /**
     * 特定ユーザーのデータのみを返します(全取得なので非推奨)
     */
    async getBoardInfomationUser(userid) {
        return await this.getBoardInfomation('user/' + userid, true);
    }

    /**
     * 特定ユーザーのデータのみを、XX:55のものに絞って返します。
     */
    async getBoardInfomationUserHours(userid) {
        return await this.getBoardInfomation(`user/${userid}/hours`, true);
    }

    /**
     * 4日間の最終更新データを取得する。
     * リクエスト４回投げるだけ
     */
    async getBoardInfomationAllDaylast() {
        let arr = await Promise.all([0, 1, 2, 3].map(day => {
            return this.getBoardInfomationDaylast(day);
        }));
        let ret = arr.shift();
        ret.data.push(...arr.map(d => d.data[0]));
        return ret;
    }
}

async function GetCups() {
    let data = await Request(EndPoint.Cups, true);
    if (!data.result) return null;
    data.cups = data.cups.filter(d => d.result).map(d => new Cup(d));
    data.now_cup = data.now_cup.result ? new Cup(data.now_cup) : null;
    if (data.now_cup !== null) data.cups[data.cups.length - 1].nowPlaying = true;
    data.url = EndPoint.Cups;
    return data;
}


const exportData = {
    Classes: {
        Rank,
        Team,
        Board,
        Rank
    },
    GetCups,
    EndPoint
};

if (typeof window !== 'undefined') {
    window.WBWrapper = exportData;
} else {
    module.exports = exportData;
}

/*
こんな感じに使えたらいいなぁ
(async ()=>{
    let cup = await GetCups();
    console.log(cup)
})();

*/