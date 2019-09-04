function isFile(val) {
  return val instanceof File
}

export default function buildFormData (data: { [key: string]: any } | null) {
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
      val.forEach(nestedVal => appendFile(`${attr}[]`, nestedVal))
    } else {
      appendFile(attr, val)
    }
  }

  return { hasFile, formData }
}
