import adapter from '../src'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

adapter.apiPath = '/api'
adapter.commonOptions = {
  headers: { 'SomeHeader': 'test' },
  withCredentials: true
}

function getLastRequest (verb) {
  const requests = mock.history[verb]

  return requests[requests.length - 1]
}

describe('adapter', () => {
  describe('ajax', () => {
    describe('when it fails with a malformed response', () => {
      beforeEach(() => { mock.onGet('/api/users').reply(500, 'ERROR') })

      it('returns an empty error', () => {
        const { abort, promise } = adapter.get('/users', {})
        expect(abort).toBeTruthy()

        return expect(promise).rejects.toEqual(new Error('Request failed with status code 500'))
      })
    })
  })

  describe('get', () => {
    let ret

    const action = () => {
      ret = adapter.get('/users', { manager_id: [2] })
    }

    describe('when it resolves', () => {
      const values = { id: 1, name: 'paco' }

      beforeEach(() => {
        mock.onGet('/api/users?manager_id%5B%5D=2').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('get')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'SomeHeader': 'test'
          })
          expect(data).toEqual(undefined)
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when it fails', () => {
      const values = '{"errors": ["foo"]}'

      beforeEach(() => {
        mock.onGet('/api/users?manager_id%5B%5D=2').reply(500, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return expect(ret.promise).rejects.toEqual(['foo'])
      })
    })
  })

  describe('post', () => {
    let ret
    let data

    const action = () => {
      ret = adapter.post('/users', data)
    }

    describe('when it resolves', () => {
      const values = { id: 1, name: 'paco' }

      beforeEach(() => {
        data = { name: 'paco' }
        mock.onPost('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('post')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=utf-8',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(data).toEqual('{"name":"paco"}')
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when it fails', () => {
      const values = '{"errors": ["foo"]}'

      beforeEach(() => {
        data = { name: 'paco' }
        mock.onPost('/api/users').reply(500, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return expect(ret.promise).rejects.toEqual(['foo'])
      })
    })

    describe('when it does not contain data', () => {
      const values = { id: 1, avatar: 'lol.png' }

      beforeEach(() => {
        data = undefined
        mock.onPost('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('post')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(data).toEqual(undefined)
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when it contains a file', () => {
      const values = { id: 1, avatar: 'lol.png' }

      beforeEach(() => {
        data = { avatar: new File([''], 'filename') }
        mock.onPost('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('post')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(Array.from(data.keys())).toEqual(['avatar'])
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when it contains an array of files', () => {
      const values = [{ id: 1, avatar: 'lol.png' }]

      beforeEach(() => {
        data = { files: [new File([''], 'filename')] }
        mock.onPost('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('post')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(Array.from(data.keys())).toEqual(['files[]'])
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when an array of objects and file is sent is sent', () => {
      const values = { id: 1, objectArray: [{ foo: 'bar' }, { foo: 'baz' }] }

      beforeEach(() => {
        data = { objectArray: [{ foo: 'bar' }, { foo: 'baz' }], files: [new File([''], 'filename')] }
        mock.onPost('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('post')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(Array.from(data.keys())).toEqual(['objectArray[0][foo]', 'objectArray[1][foo]', 'files[]'])
          expect(withCredentials).toEqual(true)
        })
      })
    })
  })

  describe('put', () => {
    let ret
    const data = { name: 'paco' }

    const action = () => {
      ret = adapter.put('/users', data)
    }

    describe('when it resolves', () => {
      const values = { id: 1, name: 'paco' }

      beforeEach(() => {
        mock.onPut('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('put')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=utf-8',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(data).toEqual('{"name":"paco"}')
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when it fails', () => {
      const values = '{"errors": ["foo"]}'

      beforeEach(() => {
        mock.onPut('/api/users').reply(500, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return expect(ret.promise).rejects.toEqual(['foo'])
      })
    })
  })

  describe('patch', () => {
    let ret
    const data = { name: 'paco' }

    const action = () => {
      ret = adapter.patch('/users', data)
    }

    describe('when it resolves', () => {
      const values = { id: 1, name: 'paco' }

      beforeEach(() => {
        mock.onPatch('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('patch')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=utf-8',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(data).toEqual('{"name":"paco"}')
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when it fails', () => {
      const values = '{"errors": ["foo"]}'

      beforeEach(() => {
        mock.onPatch('/api/users').reply(500, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return expect(ret.promise).rejects.toEqual(['foo'])
      })
    })
  })

  describe('del', () => {
    let ret

    const action = () => {
      ret = adapter.del('/users', { name: 'paco' })
    }

    describe('when it resolves', () => {
      const values = { id: 1, name: 'paco' }

      beforeEach(() => {
        mock.onDelete('/api/users').reply(200, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return ret.promise.then((vals) => {
          expect(vals).toEqual(values)

          const { params, data, headers, withCredentials } = getLastRequest('delete')
          expect(headers).toEqual({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=utf-8',
            'SomeHeader': 'test'
          })
          expect(params).toEqual(undefined)
          expect(data).toEqual('{"name":"paco"}')
          expect(withCredentials).toEqual(true)
        })
      })
    })

    describe('when it fails', () => {
      const values = '{"errors": ["foo"]}'

      beforeEach(() => {
        mock.onDelete('/api/users').reply(500, values)
        action()
      })

      it('sends a xhr request with data parameters', () => {
        expect(ret.abort).toBeTruthy()

        return expect(ret.promise).rejects.toEqual(['foo'])
      })
    })
  })
})
