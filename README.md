<h1 align="left">Hi 👋, I'm Jasjeet Mavi</h1>
<h3 align="left"><a href="https://jasmavi.dev/" target="_blank" rel="noopener noreferrer">Let's connect and make it happen.</a></h3>

## Updating the CV

Edit `resume.md`, then run `python3 scripts/build-resume.py` (Python 3, no dependencies).
This generates a two-page, text-based PDF in memory and embeds it as a base64
data URL in the contact section's download link in `index.html`. It also updates
the visible base64 text. Explicit page breaks keep roles together; the generator
rejects content that overflows a page. No separate PDF asset is generated.

The contact link uses the native HTML `download` attribute to save the embedded
PDF as `jasjeet-mavi-cv.pdf`, with no JavaScript required. Browser settings control
whether to prompt for a location or save automatically. The matching base64 is
displayed in the corner-marked square; CSS handles sizing and wrapping. Screen
readers receive the link's CV label instead of the encoded text.
