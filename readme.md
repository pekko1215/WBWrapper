# wb-wrapper
## なにこれ
http://wb-api.glitch.me/api/  
をええ感じに使うためのあれ
ブラウザでもNodeJSでも動く(闇の力により)  
ほぼほぼ自分用メモ

## 使い方
NodeJSならgit cloneしてきて
```javascript
const WBWrapper = require('./WBWrapper');
```
とかで、ブラウザならScriptタグとかでどうにかして、ソース読んだらたぶんわかる

## 用意されているもの
### Classes
 クラス
#### Rank
 - rankOrder
 - userId
 - name
 - pvnEventPoint
 - name
 - leaderCardImg
 - lv
 - team
#### Team
 - id
 - name
 - is_all
#### Board
 - date
 - url
 - teams
 - ranks
#### Rank
 - title
 - first
 - last
 - id
##### メソッド
 - getBoardInfomation(string)
    - 直接呼ぶことはない、以下のメソッドにより間接的に呼び出される。
 - getBoardInfomationAll()
    - 全取得。非常に重いので非推奨
 - getBoardInfomationHours(date)
    - XX:55のみ(ex: 17:55など)を取得。よほどのことがない限りこちらを推奨
 - getBoardInfomationLast()
    - 最終更新データを確認。
 - getBoardInfomationDaylast(day)
    - (day+1)日目最終更新を取得。daylast/0なら1日目。
 - getBoardInfomationTime(year = 0,month = 0,day = 0,hour = 0,min = 0)
    - ある時間におけるボードを取得。time/2019/02/28/15/50などと指定する。
 - getBoardInfomationUser(userid)
    - 特定ユーザーのデータのみを返します(全取得なので非推奨)
 - getBoardInfomationUserHours(userid)
    - 特定ユーザーのデータのみを、XX:55のものに絞って返します。

### GetCups()
 - Cupsの一覧を取得する。
### EndPoint
 - エンドポイント