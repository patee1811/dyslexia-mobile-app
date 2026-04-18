import { Directory, File, Paths } from 'expo-file-system';

type AzureTtsMode = 'word' | 'sentence';

type AzureSynthesizeOptions = {
  text: string;
  mode: AzureTtsMode;
  key: string;
  region: string;
  voice: string;
};

const OUTPUT_FORMAT = 'audio-24khz-96kbitrate-mono-mp3';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hashText(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(16);
}

function buildSsml(text: string, voice: string, mode: AzureTtsMode) {
  const prosodyRate = mode === 'word' ? '-4%' : '-8%';
  const prosodyPitch = mode === 'word' ? '+12%' : '+8%';

  return `<speak version="1.0" xml:lang="vi-VN"><voice name="${voice}"><prosody rate="${prosodyRate}" pitch="${prosodyPitch}">${escapeXml(
    text,
  )}</prosody></voice></speak>`;
}

function getTtsCacheDir() {
  const directory = new Directory(Paths.cache, 'tts-cache');

  if (!directory.exists) {
    directory.create({ idempotent: true, intermediates: true });
  }

  return directory;
}

export async function synthesizeAzureSpeechToFile({
  text,
  mode,
  key,
  region,
  voice,
}: AzureSynthesizeOptions): Promise<string> {
  const cacheDir = getTtsCacheDir();
  const cacheKey = hashText(`${voice}|${mode}|${text}`);
  const cachedFile = new File(cacheDir, `${cacheKey}.mp3`);

  if (cachedFile.exists) {
    return cachedFile.uri;
  }

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
      'User-Agent': 'dyslexia-mobile-coach',
    },
    body: buildSsml(text, voice, mode),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Azure TTS failed (${response.status}): ${errorText.slice(0, 140)}`);
  }

  const audioBuffer = await response.arrayBuffer();
  cachedFile.create({ intermediates: true, overwrite: true });
  cachedFile.write(new Uint8Array(audioBuffer));

  return cachedFile.uri;
}
