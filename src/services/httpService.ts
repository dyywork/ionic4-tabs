import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http"
import { LoadingController } from '@ionic/angular';
import { async } from '@angular/core/testing';

const urlHttp = 'http://dingyongya.club:3001'

@Injectable()
export class HttpService {
  loader: any;
  constructor(private http: Http, private loadingController: LoadingController) {
  }

  public async get(url: string, paramObj: any) {
    const loading = await this.loadingController.create({
      message: '加载中...',
      duration: 2000,
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    await loading.present();
    return this.http.get(urlHttp + url + this.toQueryString(paramObj))
      .toPromise()
      .then(async res => {
        await loading.dismiss()
        return await this.handleSuccess(res.json())
      })
      .catch(async error => {
        await loading.dismiss()
        return await this.handleError(error)
      });
  }

  public async post(url: string, paramObj: any) {
    const loading = await this.loadingController.create({
      message: '加载中...',
      duration: 2000
    });
    await loading.present();
    //x-www-form-urlencoded
    let headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.post(urlHttp + url, paramObj, new RequestOptions({ headers: headers }))
      .toPromise()
      .then(async res => {
        await loading.dismiss()
        return await this.handleSuccess(res.json())
      })
      .catch(async error => {
        await loading.dismiss()
        return await this.handleError(error)
      });
  }

  private async handleSuccess(result) {//请求成功的回调
    if (result && result.resultCode != "0000") {
      let params = {
        title: "错误！",
        subTitle: result.message,
      }
    }
    return Promise.resolve(result);
  }

  private async handleError(error: Response | any) {//请求失败的回调
    let msg = '请求失败';
    if (error.status == 0) {
      msg = '请求地址错误';
    }
    if (error.status == 400) {
      msg = '请求无效';
      console.log('请检查参数类型是否匹配');
    }
    if (error.status == 404) {
      msg = '请求资源不存在';
      console.error(msg + '，请检查路径是否正确');
    }
    let params = {
      title: "错误！",
      subTitle: msg,
    }
    return Promise.reject({ success: false, msg: msg });
  }

  /**
* @param obj　参数对象
* @return {string}　参数字符串
* @example
*  声明: var obj= {'name':'zhangsan',sex:1};
*  调用: toQueryString(obj);
*  返回: "?name=zhangsan&age=1"
*/
  private toQueryString(obj) {
    let ret = [];
    for (let key in obj) {
      key = encodeURIComponent(key);
      let values = obj[key];
      if (values && values.constructor == Array) {//数组
        let queryValues = [];
        for (let i = 0, len = values.length, value; i < len; i++) {
          value = values[i];
          queryValues.push(this.toQueryPair(key, value));
        }
        ret = ret.concat(queryValues);
      } else { //字符串
        ret.push(this.toQueryPair(key, values));
      }
    }
    let str = obj ? '?' + ret.join('&') : ""
    return str;

  }

  private toQueryPair(key, value) {
    if (typeof value == 'undefined') {
      return key;
    }
    return key + '=' + encodeURIComponent(value === null ? '' : String(value));
  }
}