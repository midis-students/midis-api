import { obj2query } from "./tools";
import { PORTAL_URL } from "./Constants";
import { Session } from "./types";

export async function getSession(
  login: string,
  password: string
): Promise<Session> {
  const authUrl = PORTAL_URL + "/auth/index.php?login=yes";
  const authResponse = await fetch(authUrl, {
    method: "POST",
    body: obj2query({
      AUTH_FORM: "Y",
      TYPE: "AUTH",
      USER_LOGIN: login,
      USER_PASSWORD: password,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: "manual",
  });

  const body = await authResponse.text();

  const Cookie = authResponse.headers.get("set-cookie").split(";").at(0);

  let bx = "";
  for (let group of body.matchAll(
    /\(window\.BX\|\|top\.BX\)\.message\((.*)\)/gm
  )) {
    bx = group[1].replace(/\'/g, '"');
  }

  if (bx) {
    const { bitrix_sessid, USER_ID } = JSON.parse(bx) as {
      bitrix_sessid: string;
      USER_ID: string;
    };

    return {
      Cookie,
      sessid: bitrix_sessid,
      user_id: +USER_ID,
      time: Date.now(),
    };
  }
  throw new Error(`Can't parse BX`);
}
