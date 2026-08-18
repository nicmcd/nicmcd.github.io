---
slug: scaling
title: "Scaling Infrastructure to Support Multi-Trillion Parameter LLM Training"
authors:
  - mikhail-isaev
  - admin
  - richard-vuduc
date: "2023-06-17T00:00:00Z"
type: "1"
venue: In *The Workshop on Architecture and System Support for Transformer Models 2023*
venueShort: In *ASSYST 2023*
abstract: This paper discusses efficient system designs for Large Language Model (LLM) scaling to up to 128 trillion parameters. We use a comprehensive analytical performance model to analyze how such models could be trained on current systems while maintaining 75% Model FLOPS Utilization (MFU). We first show how tensor offloading alone can be used to dramatically increase the size of trainable LLMs. We analyze performance bottlenecks when scaling on systems up to 16,384 GPUs and with models up to 128T parameters. Our findings suggest that current H100 GPUs with 80 GiB of HBM enabled with 512 GiB of tensor offloading capacity allows scaling to 11T-parameter LLMs; and getting to 128T parameters requires 120 GiB of HBM and 2 TiB of offloading memory, yielding 75%+ MFU, which is uncommon even when training much smaller LLMs today. Overall, we find it will be critical to co-design the LLM, software, and hardware to attain high performance and efficiency.
summary: We use an analytical performance model to design systems that train LLMs of up to 128 trillion parameters at 75%+ MFU.
tags:
  - Machine Learning
  - Modeling
  - Codesign
image: ./featured.png
imageAlt: Heatmap of LLM parameter counts for hidden sizes from 8,192 to 163,840 and 32 to 320 transformer blocks, with narrower models in red, wider models in blue, and optimal scaling choices framed in white
projects:
  - calculon
pdf: pubs/mikhailisaev_scaling_2023.pdf
bibPath: publication/scaling/cite.bib
---
