# JMJ Hyderabad Province — client photo replacement

**Media inventory date:** 21 October 2026  
**Scope:** Public gallery, homepage, ministry photos, institution image handling  
**Status:** The client-approved photographs have been imported into the frontend; deployment is not included.

## Complete client-photo inventory

The numbers below are taken from the complete publicly shared Google Drive folder listings, including the nested Aspirancy albums. Counts are of photograph files only.

| Filter shown on website | Source folder | Photographs |
|---|---|---:|
| Postulency | [Google Drive](https://drive.google.com/drive/folders/1zgPU9tfg3UMXrksrsfKCBUo0SviWM8_K) | 2 |
| Novices | [Google Drive](https://drive.google.com/drive/folders/1NBJKJpIQPXwO60P3i9k0k6YJ95R0OgzH) | 3 |
| Aspirancy (AS - 2025 and AS - 2026) | [Google Drive](https://drive.google.com/drive/folders/177ndCqg5Bxhrq8r8MkmePpIVmYprwWTu) | 12 |
| PCCI Meet | [Google Drive](https://drive.google.com/drive/folders/1GS4aIDMf64x03vckNnSMhJ57MuM-pTRD) | 47 |
| PENTIONARIES - Photos | [Google Drive](https://drive.google.com/drive/folders/1ZmX1PEbBbLA9Ui0Jn57j-OpHIlkwz9vd) | 20 |
| PP - 2024 | [Google Drive](https://drive.google.com/drive/folders/1M5R7Y2tn-7dKAHh9_0-OBW4gH6nPcRZi) | 53 |
| PP - 2025 | [Google Drive](https://drive.google.com/drive/folders/1JstrfJMLcqT2S6rT0EyUo-5avsNcDatx) | 79 |
| PP - 2026 | [Google Drive](https://drive.google.com/drive/folders/1jTGXralO9Itrhz2pE_K5vGLhN1ToKS-E) | 76 |
| Lay Collaboration 25.07.2026 | [Google Drive](https://drive.google.com/drive/folders/1HvbJBbGhP_gr-OEL3Pd-Bf8YSFdN3kGH) | 44 |
| Thanksgiving - PC (10.11.2024) | [Google Drive](https://drive.google.com/drive/folders/1XqWHc_dGiZUSVpMjYSaPNjdJ8X65VAs8) | 74 |
| Youth Fest - 2025 | [Google Drive](https://drive.google.com/drive/folders/1qo4z8nIl5T2uLiwl3_x2E4swwPkdb1fB) | 11 |
| ASSESSMENT TEAMS 18.02.2025 | [Google Drive](https://drive.google.com/drive/folders/1kUweJSz-NoEtJ81ylZGp1bSG4cR82rjl) | 63 |
| **Total** | **12 filters** | **484** |

Three MP4 videos are also in the Thanksgiving folder. They are intentionally excluded from the **photo** gallery and counts; they have not been erased from Google Drive.

## What changed

- The old static gallery is fully replaced by all 484 supplied photographs. The public gallery now has exactly the twelve matching filters, real counts, search, and a full-size viewer.
- Photo cards and the full-size viewer display the photographs without the name, year, or folder-name caption strip. The homepage gallery previews are also image-only; category labels remain on filter buttons so visitors can navigate all twelve collections. The underlying metadata is retained for search and accessibility.
- Previously published backend/API gallery images are not merged into the public gallery, so old uploads cannot silently reappear. New client-approved uploads should be incorporated into the validated inventory before publishing.
- Gallery filters have shareable URLs, e.g. `/gallery?category=postulency`. Homepage gallery cards lead to the relevant filter.
- Each photograph has two local WebP versions: a larger display image (maximum 1600 px), and a 500 px thumbnail. The gallery and home photo strips use lazy loading. No direct Google Drive image fetch is needed by the live website.
- The homepage now shows photographs from Lay Collaboration, Novices, Youth Fest, PCCI Meet, Postulency, and Assessment Teams, with descriptions that do not claim the modern photographs depict the founder or a specific building.
- Formation uses photos from Aspirancy, Postulency, and Novices. Pastoral and Evangelization uses Youth Fest; Social Work has a clearly captioned Lay Collaboration gathering.
- The newly supplied folders do not contain verified school, hospital, ecological-work, or institution-building photographs. Those sections retain their accurate written content without pretending an unrelated event image represents a specific ministry or institution. Institution cards use a branded placeholder until the client supplies approved images of those locations.
- Old photo assets were removed from the public deployable tree. The Province logo and publication PDFs were preserved.

## Completed quality checks

- **484 of 484** distinct source photo IDs are present in the gallery manifest, with no duplicates and correct per-folder counts.
- **968 of 968** generated WebP assets open as valid images; every hero and ministry photo reference resolves to a shipped file.
- The source photographs total **1,465.9 MiB**; the combined optimized variants total **75.9 MiB** (about **5.2%** of the original size).
- The production build passes, and **53 of 53 automated tests** pass.
- A local production preview returned **HTTP 200** for the photo gallery route, manifest, full-size WebP and thumbnail.
- The existing lint check still reports **nine unrelated pre-existing issues** in admin page typing, a notices page and an unused router constant. No errors remain in the changed media files.

## Verification and future updates

From the `frontend` directory, run:

```bash
python tools/verify_media.py
npm run build
npm run test -- --run
```

The inventory of Drive file IDs is preserved in `tools/drive_inventory.json` for one-to-one verification and potential future updates; `tools/import_client_photos.py` rebuilds the optimized assets using that inventory. Running the import script requires network access and the Pillow image library.

When the client supplies additional ministry or institution-specific images, match them to the appropriate section by confirmed identity and rerun the verification before deploying.
