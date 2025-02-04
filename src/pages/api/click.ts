import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Json = {
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Json | Buffer>
) {
    try {
        const { searchParams } = new URL(
            req.url as string,
            `https://${req.headers.host}`
        );
        const url = searchParams.get('url');
        const selector = searchParams.get('selector');
        if (!url || !selector) {
            return res
                .status(400)
                .json({ message: `A ?url query-parameter is required` })
        }
        const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
        const browser = await puppeteerCore.launch({
            executablePath,
            args: chromium.args,
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport
        });
        const page = await browser.newPage()
        await page.goto(url, {waitUntil: 'networkidle2'});
        await page.waitForSelector(selector);
        await page.click(selector);
        await browser.close();
        return res.status(200).send({message: 'correct'})
    } catch (error) {
        console.log(error);
    }

    return res.status(400).json({ message: `Wrong` });
}