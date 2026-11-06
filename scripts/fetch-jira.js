const fs = require("fs");

const domain = process.env.JIRA_DOMAIN;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_TOKEN;

const auth = Buffer
  .from(`${email}:${token}`)
  .toString("base64");

async function fetchAllIssues() {

  let allIssues = [];
  let nextPageToken = null;
  let page = 1;

  while (true) {

    let url =
      `https://${domain}.atlassian.net/rest/api/3/search/jql` +
      `?jql=project%3DBURC%20ORDER%20BY%20created%20DESC` +
      `&fields=summary,status,assignee,priority,labels,created` +
      `&maxResults=100`;

    if (nextPageToken) {
      url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
    }

    console.log(`Leyendo página ${page}...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(
        `Jira respondió ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    const pageIssues = data.issues || [];

    console.log(
      `Página ${page}: ${pageIssues.length} tickets`
    );

    allIssues.push(...pageIssues);

    if (data.isLast === true) {
      break;
    }

    if (!data.nextPageToken) {
      console.warn(
        "No llegó nextPageToken. Terminando extracción."
      );
      break;
    }

    nextPageToken = data.nextPageToken;
    page++;
  }

  return allIssues;
}

(async () => {

  try {

    const issues = await fetchAllIssues();

    const output = {
      lastUpdate: new Date().toISOString(),
      totalIssues: issues.length,
      issues
    };

    fs.writeFileSync(
      "data.json",
      JSON.stringify(output, null, 2)
    );

    console.log(
      `Extracción completada: ${issues.length} tickets`
    );

  } catch (error) {

    console.error(error);
    process.exit(1);

  }

})();
