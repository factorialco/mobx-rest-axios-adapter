import axios from 'axios'
import { stringify } from 'qs'
import buildFormData from './buildFormData'

type Request = {
  abort: () => void;
  promise: Promise<any>;
}

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

function ajax (url: string, options: Options): Request {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()

  const request = axios({
    url,
    cancelToken: source.token,
    ...ajaxOptions(options)
  })

  const promise = new Promise((resolve, reject) => {
    request
      .then(response => resolve(response.data))
      .catch(error => {
        if (axios.isCancel(error)) return resolve({})

        const json = (error.response && error.response.data) || {}
        return reject(json.errors || error)
      })
  })

  const abort = () => source.cancel()

  return { abort, promise }
}

export default {
  apiPath: '',
  commonOptions: {},

  get (path: string, data: {} | null, options: {} = {}): Request {
    const baseUrl = `${this.apiPath}${path}`
    const url = Object.entries(data || {}).length
      ? `${baseUrl}?${stringify(data)}`
      : baseUrl

    return ajax(url, {
      method: 'GET',
      ...this.commonOptions,
      ...options
    })
  },

  post (path: string, data: {} | null, options: {} = {}): Request {
    return ajax(`${this.apiPath}${path}`, {
      method: 'POST',
      data,
      ...this.commonOptions,
      ...options
    })
  },

  put (path: string, data: {} | null, options: {} = {}): Request {
    return ajax(`${this.apiPath}${path}`, {
      method: 'PUT',
      data,
      ...this.commonOptions,
      ...options
    })
  },

  patch (path: string, data: {} | null, options: {} = {}): Request {
    return ajax(`${this.apiPath}${path}`, {
      method: 'PATCH',
      data,
      ...this.commonOptions,
      ...options
    })
  },

  del (path: string, data: {} | null, options: {} = {}): Request {
    return ajax(`${this.apiPath}${path}`, {
      method: 'DELETE',
      data,
      ...this.commonOptions,
      ...options
    })
  }
}
