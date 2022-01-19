function isFile(val) {
  if (val instanceof File) return true

  const fileKeys = ['uri', 'name', 'type']
  if (fileKeys.every(_key => val && val.hasOwnProperty(_key))) return true

  return false
}

type Payload = {
  hasFile: boolean,
  formData: FormData | null
}

const isPlainObject = (obj: any) => {
  return typeof obj === 'object' && obj.constructor === Object
}

export default function buildFormData (data: { [key: string]: any } | null): Payload {
  if (!data) return { hasFile: false, formData: null }

  const formData = new FormData()
  let hasFile = false

  function appendFile (attr, val) {
    if (val === null) return

    hasFile = hasFile || isFile(val)
    formData.append(attr, val)
  }

  for (const attr of Object.keys(data)) {
    const val = data[attr]

    if (Array.isArray(val)) {
      val.forEach(function (nestedVal, index) {
        if (isPlainObject(nestedVal)) {
          for (const prop in nestedVal) {
            appendFile(`${attr}[${index}][${prop}]`, nestedVal[prop])
          }
        } else {
          appendFile(attr + "[]", nestedVal);
        }
      });
    } else {
      appendFile(attr, val)
    }
  }

  return { hasFile, formData }
}
