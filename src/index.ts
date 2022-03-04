import axios from 'axios'
import { stringify } from 'qs'
import buildFormData from './buildFormData'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type Options = {
  method: Method;
  headers?: { [key: string]: string } | null;
  withCredentials: boolean;
  onProgress?: (num: number) => void;
  data?: { [key: string]: any } | null;
}

function ajaxOptions (options: Options): {} {
  const baseOptions = {
    method: options.method,
    headers: options.headers,
    withCredentials: options.withCredentials
  }

  if (options.method === 'GET') {
    return baseOptions
  } else {
    const { hasFile, formData } = buildFormData(options.data)

    if (hasFile) {
      return {
        ...baseOptions,
        data: formData,
        onUploadProgress: (prog) => {
          if (options.onProgress) {
            const progress = Math.ceil((prog.loaded / prog.total) * 100)
            options.onProgress(progress || 100)
          }
        }
      }
    } else {
      return {
        ...baseOptions,
        data: options.data
      }
    }
  }
}

function ajax (url: string, options: Options): Promise<any> {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()

  const request = axios({
    url,
    cancelToken: source.token,
    ...ajaxOptions(options)
  })

  return request.then(response => response.data);
  // return new Promise((resolve, reject) => {
  //   request
  //     .then(response => resolve(response.data))
  //     .catch(error => {
  //       if (axios.isCancel(error)) return resolve({})

  //       const json = (error.response && error.response.data) || {}
  //       return reject(json.errors || error)
  //     })
  // })
}

export default {
  apiPath: '',
  commonOptions: {},

  get (path: string, data: {} | null, options: {} = {}): Promise<any> {
    const baseUrl = `${this.apiPath}${path}`
    const url = Object.entries(data || {}).length
      ? `${baseUrl}?${stringify(data, { arrayFormat: 'brackets' })}`
      : baseUrl

    return ajax(url, {
      method: 'GET',
      ...this.commonOptions,
      ...options
    })
  },

  post (path: string, data: {} | null, options: {} = {}): Promise<any> {
    return ajax(`${this.apiPath}${path}`, {
      method: 'POST',
      data,
      ...this.commonOptions,
      ...options
    })
  },

  put (path: string, data: {} | null, options: {} = {}): Promise<any> {
    return ajax(`${this.apiPath}${path}`, {
      method: 'PUT',
      data,
      ...this.commonOptions,
      ...options
    })
  },

  patch (path: string, data: {} | null, options: {} = {}): Promise<any> {
    return ajax(`${this.apiPath}${path}`, {
      method: 'PATCH',
      data,
      ...this.commonOptions,
      ...options
    })
  },

  del (path: string, data: {} | null, options: {} = {}): Promise<any> {
    return ajax(`${this.apiPath}${path}`, {
      method: 'DELETE',
      data,
      ...this.commonOptions,
      ...options
    })
  }
}
