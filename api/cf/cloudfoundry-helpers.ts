'use server';

import { camelToSnakeCase } from '@/helpers/text';
import { request } from '../api';
import { getToken } from './token';

type MethodType = 'delete' | 'get' | 'patch' | 'post';

interface ApiRequestOptions {
  method: MethodType;
  headers: {
    Authorization: string;
    'Content-Type'?: string;
  };
  body?: any;
}

const CF_API_URL = process.env.CF_API_URL;

export async function cfRequest(
  path: string,
  method: MethodType = 'get',
  data?: any
): Promise<Response> {
  try {
    const options = await cfRequestOptions(method, data);
    return await request(CF_API_URL + path, options);
  } catch (error: any) {
    if (process.env.NODE_ENV == 'development') {
      console.error(
        `request to ${path} with method ${method} failed: ${error.statusCode} -- ${error.message}`
      );
    }
    throw new Error(`something went wrong: ${error.message}`);
  }
}

export async function cfRequestOptions(
  method: MethodType,
  data: any
): Promise<ApiRequestOptions> {
  const options: ApiRequestOptions = {
    method: method,
    headers: {
      Authorization: `bearer ${getToken()}`,
    },
  };
  if (data) {
    options.body = JSON.stringify(data);
    options.headers['Content-Type'] = 'application/json';
  }
  return options;
}

// converts arguments such as `organizationGuids=['org1', 'org2']`
// to the format expected by CF API: '?organization_guids=org1, org2'
export async function prepPathParams(options: {
  [key: string]: Array<string> | string;
}): Promise<string> {
  const params = {} as any;

  for (const [key, values] of Object.entries(options)) {
    if (values === undefined) {
      break;
    }

    var keyName = camelToSnakeCase(key);
    if (Array.isArray(values)) {
      params[keyName] = values.join(',');
    } else {
      params[keyName] = values;
    }
  }

  const urlParams = new URLSearchParams(params);
  return `?${urlParams.toString()}`;
}
