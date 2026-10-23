# Downloading the JMJ Hyderabad Province frontend in smaller ZIP files

The project is split into five smaller ZIPs to make downloading easier. The files together contain exactly the same frontend code and 484 optimized photographs as the full project.

1. Download **JMJ_Frontend_Core.zip** and **JMJ_Photos_Part_1.zip** through **JMJ_Photos_Part_4.zip**.
2. Extract **JMJ_Frontend_Core.zip** into a new folder, such as `JMJ-Project`. It creates a `frontend` subfolder.
3. Extract each of the four photo ZIPs **into the same `JMJ-Project` folder**. Each also contains the `frontend/public/media/client-2026/...` path. When Windows asks to merge folders, allow the merge.
4. Open a terminal inside `JMJ-Project/frontend` and run `npm install` followed by `npm run dev`.
5. For verification, run `python tools/verify_media.py`. It should report **484/484 photos, 12 filters, 968 images**.

Do not extract the photo ZIPs *inside* the `frontend` folder: their internal structure already includes the `frontend/` directory.
