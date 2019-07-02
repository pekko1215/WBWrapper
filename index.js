const Request = (()=>{
    if(typeof window !== 'undefined'){
        return (url)=>fetch(url).then(d=>d.json());
    }else{
        return (url)=>new Promise(r=>{
            require('request')(url,(e,req,body)=>{
                r(JSON.parse(body));
            })
        })
    }
})()
const EndPoint = {
    Base:'https://wb-api.glitch.me'
}

EndPoint.Cups = EndPoint.Base + '/api/bi/';
EndPoint.Board = EndPoint.Base + '/api/bd/';

class Rank {
    constructor(obj,team){
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
    constructor(obj){
        this.id = obj.id;
        this.name = obj.name;
        this.is_all = obj.is_all;
    }
}

class Board {
    constructor(obj,cup){
        this.date = new Date(obj.dateFormatted);
        this.url = obj.url;
        this.cup = cup;
        this.teams = obj.teams.map(obj=>new Team(obj));
        this.ranks = obj.ranks.map((arr,i)=>{
            return arr.map(d=>{
                return new Rank(d,this.teams[i]);
            })
        });
        this.teams.forEach((team,i)=>team.ranks = this.ranks[i]);
    }
}

class Cup {
    constructor(obj){
        this.title = obj.title;
        this.first = obj.first;
        this.last = obj.last;
        this.id = obj.id;
    }
    async getBoardInfomation(query){
        if(this.id == -1 || this.id === undefined) return null;
        let url = EndPoint.Board + `${this.id}/`+query;
        let data = await Request(url);
        if(!data.result) return null;
        data = data.data[0];
        data.url = url;
        data = new Board(data,this);
        return data;
    }
    /**
     *全取得。非常に重いので非推奨
     */
    async getBoardInfomationAll(){
        return await this.getBoardInfomation('all');
    }
    /**
     * XX:55のみ(ex: 17:55など)を取得。よほどのことがない限りこちらを推奨
     */
    async getBoardInfomationHours(date){
        return await this.getBoardInfomation('hours');
    }
    /**
     * 最終更新データを確認。
     */
    async getBoardInfomationLast(){
        return await this.getBoardInfomation('last');
    }

    /**
     * (day+1)日目最終更新を取得。daylast/0なら1日目。
     */
    async getBoardInfomationDaylast(day){
        return await this.getBoardInfomation('daylast/'+day);
    }

    /**
     * ある時間におけるボードを取得。time/2019/02/28/15/50などと指定する。
     */
    async getBoardInfomationTime(year = 0,month = 0,day = 0,hour = 0,min = 0){
        return await this.getBoardInfomation(`time/${year}/${month}/${day}/${hour}/${min}`)
    }

    /**
     * 特定ユーザーのデータのみを返します(全取得なので非推奨)
     */
    async getBoardInfomationUser(userid){
        return await this.getBoardInfomation('user/'+userid);
    }

    /**
     * 特定ユーザーのデータのみを、XX:55のものに絞って返します。
     */    
    async getBoardInfomationUserHours(userid){
        return await this.getBoardInfomation(`user/${userid}/hours`);
    }
}

async function GetCups(){
    let data = await Request(EndPoint.Cups);
    if(!data.result) return null;
    data.cups = data.cups.filter(d=>d.result).map(d=>new Cup(d));
    data.now_cup = data.now_cup.result ? new Cup(data.now_cup) : null;
    data.url = EndPoint.Cups;
    return data;
}


const exportData = {
    Classes:{
        Rank,Team,Board,Rank
    },
    GetCups,
    EndPoint
};

if(typeof window !== 'undefined'){
    window.WBWrapper = exportData;
}else{
    module.exports = exportData;
}

/*
こんな感じに使えたらいいなぁ
(async ()=>{
    let cup = await GetCups();
    console.log(cup)
})();

*/