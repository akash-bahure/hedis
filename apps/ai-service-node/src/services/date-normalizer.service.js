function normalizeDate(rawDate) {
  if (!rawDate) return null;

  const date = rawDate.trim();

  // MM/DD/YYYY
  let match = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  // MM/DD/YY
  match = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (match) {
    const [, mm, dd, yy] = match;
    const yyyy = Number(yy) > 30 ? `19${yy}` : `20${yy}`;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  // MM.YYYY
  match = date.match(/^(\d{1,2})\.(\d{4})$/);
  if (match) {
    const [, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-01`;
  }

  // MM.YY
  match = date.match(/^(\d{1,2})\.(\d{2})$/);
  if (match) {
    const [, mm, yy] = match;
    const yyyy = Number(yy) > 30 ? `19${yy}` : `20${yy}`;
    return `${yyyy}-${mm.padStart(2, "0")}-01`;
  }

  // MM/YYYY
  match = date.match(/^(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-01`;
  }

  // MM/YY
  match = date.match(/^(\d{1,2})\/(\d{2})$/);
  if (match) {
    const [, mm, yy] = match;
    const yyyy = Number(yy) > 30 ? `19${yy}` : `20${yy}`;
    return `${yyyy}-${mm.padStart(2, "0")}-01`;
  }

  // Month YYYY
  match = date.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i
  );

  if (match) {
    const months = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    const month = months[match[1].toLowerCase()];
    const year = match[2];

    return `${year}-${month}-01`;
  }

  // April/2019
  match = date.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\/(\d{4})$/i
  );

  if (match) {
    const months = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    return `${match[2]}-${months[match[1].toLowerCase()]}-01`;
  }

  return date;
}

module.exports = {
  normalizeDate,
};