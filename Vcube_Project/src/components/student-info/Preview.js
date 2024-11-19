import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const Preview = ({ html, css, js }) => {
    const [srcDoc, setSrcDoc] = useState('');
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            const safeHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
            const safeCss = DOMPurify.sanitize(css, { USE_PROFILES: { css: true } });
            const safeJs = DOMPurify.sanitize(js, { USE_PROFILES: { html: true } });
            setSrcDoc(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>${safeCss}</style>
                    </head>
                    <body>
                        ${safeHtml}
                        <script>${safeJs}</script>
                    </body>
                </html>
            `);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [html, css, js]);

    return (
    <>
        <Typography variant="h5" sx={{margin: '10px'}}>Output:</Typography>
        <iframe
            srcDoc={srcDoc}
            style={{ width: '100%', height: '95%', border: 'solid 1px black',
                     maxHeight : '100%', overflowY : 'auto', scrollbarWidth : 'thin',
                     borderRadius : '10px'}}
            title="Preview"
        />
        </>
    );
};

export default Preview;