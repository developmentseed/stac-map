import { expect, test } from "vitest";
import { toAbsoluteUrl } from "../../src/utils/href";

test("should preserve UTF8 characters while making URLS absolute", async () => {
  expect(toAbsoluteUrl("🦄.tiff", new URL("s3://some-bucket"))).equals(
    "s3://some-bucket/🦄.tiff"
  );
  expect(
    toAbsoluteUrl("https://foo/bar/🦄.tiff", new URL("s3://some-bucket"))
  ).equals("https://foo/bar/🦄.tiff");
  expect(
    toAbsoluteUrl("../../../🦄.tiff", new URL("s3://some-bucket/🌈/path/a/b/"))
  ).equals("s3://some-bucket/🌈/🦄.tiff");

  expect(toAbsoluteUrl("a+🦄.tiff", new URL("s3://some-bucket/🌈/"))).equals(
    "s3://some-bucket/🌈/a+🦄.tiff"
  );

  expect(
    toAbsoluteUrl("../../../🦄.tiff", new URL("https://some-url/🌈/path/a/b/"))
  ).equals("https://some-url/%F0%9F%8C%88/%F0%9F%A6%84.tiff");
  expect(
    toAbsoluteUrl(
      "foo/🦄.tiff?width=1024",
      new URL("https://user@[2601:195:c381:3560::f42a]:1234/test")
    )
  ).equals(
    "https://user@[2601:195:c381:3560::f42a]:1234/foo/%F0%9F%A6%84.tiff?width=1024"
  );
});
